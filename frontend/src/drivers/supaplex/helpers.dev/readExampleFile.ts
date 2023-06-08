import fs from "fs";

const examplesDir = `${__dirname}/../examples.dev`;

export const readExampleFile = (exampleFilename: string) =>
  new Promise<Buffer>((resolve, reject) => {
    fs.readFile(`${examplesDir}/${exampleFilename}`, (err, data: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
