import fs from "fs-extra"
import path from "path"
import * as Joi from "@hapi/joi"

import resourceSchema from "../resource-schema"

const makePath = (root, relativePath) => path.join(root, relativePath)

const directoryExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { id, path: directoryPath }) => {
  const fullPath = makePath(root, directoryPath)
  await fs.ensureDir(fullPath)
  return read({ root }, directoryPath)
}

const update = async (context, resource) => {
  // TODO figure out how to move directories when it shifts
  // probably update needs to be called with the previous version
  // of the resource.
  //
  // Also Directory needs a key.
  const fullPath = makePath(context.root, resource.id)
  await fs.ensureDir(fullPath)
  return read(context, resource.id)
}

const read = async (context, id) => {
  const fullPath = makePath(context.root, id)

  if (!directoryExists(fullPath)) {
    return undefined
  }

  const resource = { id, path: id }
  resource._message = message(resource)
  return resource
}

const destroy = async (context, directoryResource) => {
  const fullPath = makePath(context.root, directoryResource.id)
  await fs.rmdir(fullPath)
  return directoryResource
}

export const plan = async (context, { id, path: directoryPath }) => {
  const plan = {
    describe: `Create directory "${directoryPath}"`,
  }

  return plan
}

const message = resource => `Created directory "${resource.path}"`

const schema = {
  path: Joi.string(),
  ...resourceSchema,
}

export const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

export { schema, create, update, read, destroy }
