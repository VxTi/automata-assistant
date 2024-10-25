/**
 * @fileoverview FileUploads.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 25 - 17:25
 */
import { AIContext, AIModel }                             from "./AIContext";
import { FilePurpose, FileUploadList, FileUploadRequest } from "ai-file-uploads";

export const FileUploadSizeLimit = 100 * 1024 * 1024; // 100MB

/**
 * The file uploads model.
 * This model is used to upload files to the AI.
 */
export class FileUploads extends AIModel {

    public constructor(context: AIContext) {
        super(context, 'files');
    }

    /**
     * Upload a file to the AI.
     * @param request The file upload request.
     */
    public async upload(request: FileUploadRequest) {
        if ( request.file.size > FileUploadSizeLimit ) {
            return Promise.reject('File size limit exceeded.');
        }
        const formData = new FormData();
        formData.append('file', request.file, request.file.name);
        formData.append('purpose', request.purpose);

        console.log('formData', formData);

        return await super.create(formData);
    }

    /**
     * Get the file uploads.
     * @param purpose The purpose of the file.
     */
    public async get(purpose?: FilePurpose): Promise<FileUploadList> {
        return await super.create({}, 'GET', purpose ? `purpose=${purpose}` : '');
    }
}
