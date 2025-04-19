// Define types for local file operations
export interface LocalFileItem {
  contentType?: string;
  createdTime: Date;
  isDirectory: boolean;
  lastAccessTime: Date;
  // Spotlight specific metadata
  metadata?: {
    [key: string]: any;
  };
  modifiedTime: Date;
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface ListLocalFileParams {
  path: string;
}

export interface LocalReadFileParams {
  loc?: [number, number];
  path: string;
}

export interface LocalReadFilesParams {
  paths: string[];
}

export interface LocalReadFileResult {
  /**
   * Character count of the content within the specified `loc` range.
   */
  charCount: number;
  /**
   * Content of the file within the specified `loc` range.
   */
  content: string;
  createdTime: Date;
  fileType: string;
  filename: string;
  /**
   * Line count of the content within the specified `loc` range.
   */
  lineCount: number;
  loc: [number, number];
  modifiedTime: Date;
  /**
   * Total character count of the entire file.
   */
  totalCharCount: number;
  /**
   * Total line count of the entire file.
   */
  totalLineCount: number;
}

export interface LocalSearchFilesParams {
  directory?: string;
  keywords: string; // Optional directory to limit search
}

export interface OpenLocalFileParams {
  path: string;
}

export interface OpenLocalFolderParams {
  isDirectory?: boolean;
  path: string;
}
