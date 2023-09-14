import get from 'lodash/get';
import isNil from 'lodash/isNil';
import max from 'lodash/max';
import set from 'lodash/set';
import trim from 'lodash/trim';
import * as XLSX from 'xlsx';

/**
 * pick as lodash but return flattern object
 * @param {*} obj
 * @param {*} paths
 */
export function pickF(obj, paths = []) {
  const res = {};
  for (let key of paths) {
    res[key] = get(obj, key);
  }
  return res;
}

export const getHeaderDeep = (cs, deep = 0) => {
  return max(cs.map((c) => (c.children ? getHeaderDeep(c.children, deep + 1) : deep)));
};

export const genHeaderCells = (columns = []) => {
  const flattenCs = [];
  const merges = [];
  const maxDeep = getHeaderDeep(columns);

  const genHeader = (
    cs = [], // columns
    row = 0, // row iterator
    col = 0 // col iterator
  ) => {
    let currentCol = col;
    let ret = {};
    let width = 0;

    cs.forEach((c) => {
      ret[XLSX.utils.encode_cell({ c: currentCol, r: row })] = {
        v: c.title,
        t: 's',
      };
      if (c.children) {
        // 如果有children 处理表头横向合并
        const { ret: childrenRet, widthRet } = genHeader(c.children, row + 1, currentCol);
        ret = { ...ret, ...childrenRet };
        merges.push({
          s: { r: row, c: currentCol },
          e: { r: row, c: currentCol + c.children.length + widthRet - 1 },
        });
        currentCol += c.children.length + widthRet;
        width++;
      } else {
        // 纵向合并
        if (maxDeep - row > 0) {
          merges.push({
            s: { c: currentCol, r: row },
            e: { c: currentCol, r: maxDeep },
          });
        }
        currentCol++;
        flattenCs.push(c);
      }
    });
    return { ret, widthRet: width };
  };

  const { ret: headerCells } = genHeader(columns);

  headerCells['!merges'] = merges;
  headerCells['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxDeep, c: flattenCs.length },
  });
  headerCells['!cols'] = flattenCs.map((f) => ({
    wpx: f._width || 50,
  }));

  return {
    headerCells,
    flattenCs,
    maxDeep,
  };
};

function rows2Data(flattenCs, rows = []) {
  const dataIndexes = flattenCs.map((c) => c.dataIndex || c.key).filter((val) => Boolean(val));
  const fills = flattenCs.map((c) => (isNil(c._fill) ? '' : c._fill));
  const data = rows
    .map((r) => pickF(r, dataIndexes))
    .map((r) => dataIndexes.map((k, i) => (isNil(r[k]) ? fills[i] : r[k])));

  return data;
}

export function writeXlsx({ columns = [], distFile = 'tmp.xlsx', type = 'xlsx', rows = [], sheetName = 'Sheet1' }) {
  const { headerCells: ws, flattenCs, maxDeep } = genHeaderCells(columns);

  const wb = XLSX.utils.book_new();

  const data = rows2Data(flattenCs, rows);

  XLSX.utils.sheet_add_aoa(ws, data, {
    origin: { r: maxDeep + 1, c: 0 },
  });

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, distFile, { bookType: type });
}

export function appendXlsx({ columns = [], srcFileData, rows = [], sheetName = 'Sheet1', distFile, type = 'xlsx' }) {
  const { flattenCs, headerCells: ws } = genHeaderCells(columns);
  const data = rows2Data(flattenCs, rows);

  const wb = XLSX.read(srcFileData, { type: 'buffer', cellDates: true });

  const isNewSheet = !wb.SheetNames.includes(sheetName);
  const sheet = isNewSheet ? ws : wb.Sheets[sheetName];

  const curRange = XLSX.utils.decode_range(sheet['!ref']);

  XLSX.utils.sheet_add_aoa(sheet, data, {
    origin: { r: curRange.e.r + 1, c: 0 },
  });

  if (isNewSheet) {
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  }

  XLSX.writeFile(wb, distFile, { bookType: type });
}

export function readXlsx({ columns = [], fileData }) {
  const wb = XLSX.read(fileData, { type: 'buffer', cellDates: true });

  /** grab first sheet */
  const wsname = wb.SheetNames[0];
  const ws = wb.Sheets[wsname];

  const { flattenCs, maxDeep } = genHeaderCells(columns);

  /** split headers and content */
  const ret = XLSX.utils.sheet_to_json(ws, { header: 'A' });
  const headers = ret.slice(0, maxDeep + 1);
  const content = ret.slice(maxDeep + 1);

  /** map columns */
  for (const header of headers) {
    Object.keys(header).forEach((i) => {
      const title = header[i];
      const found = flattenCs.find((c) => c.title === trim(title));
      if (found) found._index = i;
    });
  }

  /** content to array of object */
  const aoa = content.map((rawRow) =>
    flattenCs
      .filter((f) => f._index && (f.key || f.dataIndex))
      .reduce((acc, column) => {
        let val = rawRow[column._index];

        if (typeof val === 'string') val = trim(val);

        if (column._fill && val === column._fill) {
          val = '';
        }

        set(acc, column.dataIndex || column.key, val);
        return acc;
      }, {})
  );

  return aoa;
}
