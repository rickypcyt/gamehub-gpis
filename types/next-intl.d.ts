declare module "next-intl/server" {
  type Messages = Record<string, unknown>;

  export function getLocale(): Promise<string>;
  export function getMessages<Namespace extends Messages = Messages>(): Promise<Namespace>;
  export function getTranslations(
    namespaceOrOptions?:
      | string
      | {
          locale?: string;
          namespace?: string;
        }
  ): Promise<(key: string) => string>;
  export function getRequestConfig(
    callback: () => Promise<{
      locale: string;
      messages: Messages;
      timeZone?: string;
      now?: Date;
    }>
  ): unknown;
  export function setRequestLocale(locale: string): void;
}
