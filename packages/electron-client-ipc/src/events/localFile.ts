import {
  ListLocalFileParams,
  LocalFileItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  MoveLocalFileParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
  RenameLocalFileParams,
  RenameLocalFileResult,
} from '../types';

export interface LocalFilesDispatchEvents {
  // Local Files API Events
  listLocalFiles: (params: ListLocalFileParams) => LocalFileItem[];
  moveFile: (params: MoveLocalFileParams) => RenameLocalFileResult;
  // New methods
  openLocalFile: (params: OpenLocalFileParams) => void;
  openLocalFolder: (params: OpenLocalFolderParams) => void;
  readLocalFile: (params: LocalReadFileParams) => LocalReadFileResult;
  readLocalFiles: (params: LocalReadFilesParams) => LocalReadFileResult[];

  renameLocalFile: (params: RenameLocalFileParams) => {
    error?: any;
    newPath?: string;
    success: boolean;
  };
  searchLocalFiles: (params: LocalSearchFilesParams) => LocalFileItem[];
}
