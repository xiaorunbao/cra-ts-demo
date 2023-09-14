import React from 'react';

import { ymd, ymdhms } from 'src/lib/lang/time';

export interface FormatProps<T = any> {
  value: T | undefined;
  defaultValue?: NonNullable<T>;
  isValid?: (v?: T) => boolean;
  formatter?: (this: void, v: T) => NonNullable<React.ReactNode>;
  fallback?: NonNullable<React.ReactNode>;
  suffix?: string;
  prefix?: string;
  children?: (result: string) => JSX.Element;
}

const isDefAndNotNull = (v: any) => typeof v !== 'undefined' && v !== null;

export function Format<T>({
  value,
  isValid = isDefAndNotNull,
  defaultValue,
  formatter = String,
  fallback = '-',
  suffix = '',
  prefix = '',
  children,
}: FormatProps<NonNullable<T>>) {
  if (!isValid(value)) {
    value = defaultValue;
  }
  if (!isValid(value)) {
    return <React.Fragment>{fallback}</React.Fragment>;
  }

  const result = formatter(value!);

  if (children) {
    return children(`${prefix}${result}${suffix}`);
  }
  return <React.Fragment>{`${prefix}${result}${suffix}`}</React.Fragment>;
}

export interface DateFormatProps {
  value: string | undefined;
  defaultValue?: NonNullable<string>;
  fallback?: NonNullable<React.ReactNode>;
}

export const FormatDate: React.FC<DateFormatProps> = (props) => {
  return <Format {...props} isValid={(d) => d !== undefined && !isNaN(Date.parse(d))} formatter={ymdhms} />;
};

export const FormatShortDate: React.FC<DateFormatProps> = (props) => {
  return <Format {...props} isValid={(d) => d !== undefined && !isNaN(Date.parse(d))} formatter={ymd} />;
};
