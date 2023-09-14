import { CheckCircleFilled, CloseCircleFilled, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Progress, Row, Space, Upload, UploadProps } from 'antd';
import styled from 'styled-components';

import { fixedN } from 'src/lib/lang/number';
import { ImportError, ImportStatus } from 'src/lib/redux-toolkit/xlsx-import';

const showUploadList = { showRemoveIcon: false, showPreviewIcon: false, showDownloadIcon: false };

interface ImportModalProps<DataType> {
  title: string;
  template?: {
    href: string;
    download: string;
  };
  status: ImportStatus;
  errors: ImportError[];
  data: DataType[];
  step: number;
  file?: string;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  beforeUpload: UploadProps['beforeUpload'];
}

export function ImportModal<DataType>({
  title,
  onOk,
  onCancel,
  beforeUpload,
  template,
  status,
  errors,
  data,
  step,
  file,
}: ImportModalProps<DataType>) {
  const fileList = file ? [{ name: file, uid: 'must_has_uid' }] : [];
  const okText = status === ImportStatus.SUCCESS ? '完成' : '导入';
  const okDisabled = status !== ImportStatus.READY && status !== ImportStatus.SUCCESS;

  return (
    <Modal
      title={title}
      open
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      okButtonProps={{ disabled: okDisabled }}
      confirmLoading={status === ImportStatus.PROCESSING}
      maskClosable={false}
      width={600}
    >
      <Space align="baseline">
        <Upload
          maxCount={1}
          beforeUpload={beforeUpload}
          fileList={fileList}
          accept=".xlsx"
          showUploadList={showUploadList}
        >
          <Button>
            <UploadOutlined />
            上传文件
          </Button>
        </Upload>
        {template && (
          <span>
            &nbsp; 请上传 excel 格式文件，下载
            <a href={template.href} download={template.download}>
              文件模板
            </a>
          </span>
        )}
      </Space>

      {status === ImportStatus.INVALID && (
        <ResultContainer>
          <Row>
            <CloseCircleFilled style={{ color: 'red', fontSize: 20, marginBottom: 5 }} />
            <h5>&nbsp; 解析失败</h5>
          </Row>
          <p className="hint">上传数据有误，请修改后再次上传</p>
          {errors.slice(0, 10).map((err, index) => (
            <p key={index}>
              第{err.row}行: {err.message}
            </p>
          ))}
        </ResultContainer>
      )}
      {status === ImportStatus.READY && (
        <ResultContainer>
          <Row>
            <CheckCircleFilled style={{ color: 'green', fontSize: 20, marginBottom: 5 }} />
            <h5>&nbsp; 解析成功</h5>
          </Row>
          <p className="hint">将导入 {data.length} 条记录</p>
        </ResultContainer>
      )}
      {status === ImportStatus.SUCCESS && (
        <ResultContainer>
          <Row>
            <CheckCircleFilled style={{ color: 'green', fontSize: 20, marginBottom: 5 }} />
            <h5>&nbsp; 导入成功</h5>
          </Row>
          <p className="hint">已导入 {step} 条记录</p>
        </ResultContainer>
      )}
      {status === ImportStatus.FAILURE && (
        <ResultContainer>
          <Row>
            <CloseCircleFilled style={{ color: 'red', fontSize: 20, marginBottom: 5 }} />
            <h5>&nbsp; 导入失败</h5>
          </Row>
          <p className="hint">导入错误，已终止。请修改后再次上传</p>
          {errors.map((err, index) => (
            <p key={index}>
              第{err.row}行: {err.message}
            </p>
          ))}
        </ResultContainer>
      )}
      {status === ImportStatus.PROCESSING && (
        <ResultContainer>
          <Progress percent={fixedN((step / data.length) * 100, 0)} status="active" />
          <p className="hint">已导入 {step} 条记录</p>
        </ResultContainer>
      )}
    </Modal>
  );
}

const ResultContainer = styled.div`
  margin-top: 20px;

  p.hint {
    color: grey;
  }
`;
