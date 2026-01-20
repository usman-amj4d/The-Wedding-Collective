import DataURIParser from "datauri/parser.js";
import path from "path";

export const getDataURI = (file) => {
  try {
    const parser = new DataURIParser();

    const extensionName = path.extname(file.originalname).toString();

    return parser.format(extensionName, file.buffer);
  } catch (error) {
    console.log(error);
  }
};
