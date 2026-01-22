export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) return cb(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'gif', 'png'];

  if (validExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(new Error('File extension not allowed'), false);
};
