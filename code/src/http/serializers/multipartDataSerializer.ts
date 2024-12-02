export default class MultipartDataSerializer {
  /**
   * A unique boundary string used to separate parts of the multipart/form-data payload.
   *
   * @type {string}
   */
  private readonly boundary: string;

  /**
   * Create a new Multipart Data Serializer instance.
   */
  constructor() {
    this.boundary = this.generateBoundary();
  }

  /**
   * Generates a unique boundary string for a multipart/form-data payload.
   * The boundary ensures proper separation of parts in the payload.
   *
   * @returns {string}
   */
  private generateBoundary(): string {
    return `----form-data-boundary-${Date.now()}`;
  }

  /**
   * Creates a multipart/form-data payload from a given FormData object.
   *
   * @param {FormData} data
   *
   * @returns {string}
   */
  public generateMultipartPayload(data: FormData): string {
    const lines: string[] = [];

    data.forEach((value, key) => {
      lines.push(`--${this.boundary}`);

      if (value instanceof File) {
        lines.push(
          `Content-Disposition: form-data; name="${key}"; filename="${value.name}"`,
          `Content-Type: ${value.type || 'application/octet-stream'}`,
        );
        lines.push('');
        lines.push(value as unknown as string);
      } else {
        lines.push(`Content-Disposition: form-data; name="${key}"`);
        lines.push('');
        lines.push(value);
      }
    });

    lines.push(`--${this.boundary}--`);

    return lines.join('\r\n');
  }

  /**
   * Retrieves the boundary string used for the multipart/form-data payload.
   *
   * @returns {string}
   */
  public getBoundary(): string {
    return this.boundary;
  }
}
