import { readFileSync } from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArrayBuffer | { errorMessage: string }>
) {
  const { serverRuntimeConfig } = getConfig();

  let { model } = req.query;

  if (!model) {
    res.status(400).send({ errorMessage: "Please provide a model name" });
  }

  if (Array.isArray(model)) {
    model = model[0];
  }

  try {
    const modelFile = readFileSync(
      path.join(
        serverRuntimeConfig.PROJECT_ROOT,
        "./public/models/",
        `${model}.gltf`
      )
    );

    res.status(200).send(modelFile);
  } catch (e) {
    console.log(e);
    res.status(404).send({ errorMessage: "Model not found" });
  }
}
