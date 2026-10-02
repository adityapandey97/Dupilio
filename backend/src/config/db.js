import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const sandboxDir = path.join(process.cwd(), 'db_sandbox');

// Ensure database sandbox directory exists
if (!fs.existsSync(sandboxDir)) {
  fs.mkdirSync(sandboxDir, { recursive: true });
}

export let useSandboxDB = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('\n⚠️  No MONGODB_URI found in environment variables. Falling back to local file-based Database sandbox.\n');
    useSandboxDB = true;
    return;
  }

  try {
    // 3 seconds timeout to quickly fall back if service is down
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (err) {
    console.warn(`\n⚠️  Failed to connect to MongoDB at ${uri}. Falling back to local file-based Database sandbox. Error: ${err.message}\n`);
    useSandboxDB = true;
  }
};

/**
 * Factory creating a Unified Mongoose/Sandbox database model adapter.
 */
export const createModel = (name, schemaDefinition) => {
  // Create real Mongoose Schema & Model
  const mongooseSchema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  const MongooseModel = mongoose.model(name, mongooseSchema);

  // File path for mock sandbox data
  const filePath = path.join(sandboxDir, `${name.toLowerCase()}.json`);

  const readSandbox = () => {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  };

  const writeSandbox = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  };

  return {
    find: (query = {}) => {
      if (!useSandboxDB) {
        return MongooseModel.find(query).lean();
      }

      let items = readSandbox();
      let filtered = items.filter(item => {
        for (let key in query) {
          if (query[key] && typeof query[key] === 'object' && query[key].$in) {
            if (!query[key].$in.includes(item[key])) return false;
          } else if (query[key] && typeof query[key] === 'object' && query[key].$ne !== undefined) {
            if (item[key] === query[key].$ne) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });

      // Provide Mongoose-like chainable interface for sandbox
      const promise = Promise.resolve(filtered);
      promise.sort = (sortObj) => {
        const sortedPromise = promise.then(data => {
          const cloned = [...data];
          for (let key in sortObj) {
            const dir = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;
            cloned.sort((a, b) => {
              if (a[key] < b[key]) return -1 * dir;
              if (a[key] > b[key]) return 1 * dir;
              return 0;
            });
          }
          return cloned;
        });
        sortedPromise.limit = (n) => sortedPromise.then(d => d.slice(0, n));
        return sortedPromise;
      };
      promise.limit = (n) => {
        const limitedPromise = promise.then(data => data.slice(0, n));
        limitedPromise.sort = (sortObj) => limitedPromise.then(data => {
          const cloned = [...data];
          for (let key in sortObj) {
            const dir = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;
            cloned.sort((a, b) => {
              if (a[key] < b[key]) return -1 * dir;
              if (a[key] > b[key]) return 1 * dir;
              return 0;
            });
          }
          return cloned;
        });
        return limitedPromise;
      };

      return promise;
    },

    findOne: async (query = {}) => {
      if (!useSandboxDB) return MongooseModel.findOne(query).lean();
      
      let items = readSandbox();
      return items.find(item => {
        for (let key in query) {
          if (query[key] && typeof query[key] === 'object' && query[key].$in) {
            if (!query[key].$in.includes(item[key])) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      if (!useSandboxDB) return MongooseModel.findById(id).lean();
      
      let items = readSandbox();
      return items.find(item => item._id === id || String(item._id) === String(id)) || null;
    },

    create: async (data) => {
      if (!useSandboxDB) {
        const doc = await MongooseModel.create(data);
        return doc.toObject();
      }
      
      let items = readSandbox();
      const newItem = {
        _id: data._id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(newItem);
      writeSandbox(items);
      return newItem;
    },

    insertMany: async (docs = []) => {
      if (!useSandboxDB) {
        return MongooseModel.insertMany(docs);
      }
      let items = readSandbox();
      const created = docs.map(data => ({
        _id: data._id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      items.push(...created);
      writeSandbox(items);
      return created;
    },

    findByIdAndUpdate: async (id, update, options = { new: true }) => {
      if (!useSandboxDB) return MongooseModel.findByIdAndUpdate(id, update, options).lean();
      
      let items = readSandbox();
      let idx = items.findIndex(item => item._id === id || String(item._id) === String(id));
      if (idx === -1) return null;
      
      const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
      delete fieldsToUpdate.$set;

      const updatedItem = {
        ...items[idx],
        ...fieldsToUpdate,
        updatedAt: new Date().toISOString()
      };
      
      items[idx] = updatedItem;
      writeSandbox(items);
      return updatedItem;
    },

    findOneAndUpdate: async (query, update, options = { new: true, upsert: false }) => {
      if (!useSandboxDB) return MongooseModel.findOneAndUpdate(query, update, options).lean();

      let items = readSandbox();
      let idx = items.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });

      if (idx === -1) {
        if (options && options.upsert) {
          const fieldsToSet = update.$set ? { ...update.$set } : { ...update };
          delete fieldsToSet.$set;
          const newItem = {
            _id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...query,
            ...fieldsToSet,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          items.push(newItem);
          writeSandbox(items);
          return newItem;
        }
        return null;
      }

      const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
      delete fieldsToUpdate.$set;

      const updatedItem = {
        ...items[idx],
        ...fieldsToUpdate,
        updatedAt: new Date().toISOString()
      };

      items[idx] = updatedItem;
      writeSandbox(items);
      return updatedItem;
    },

    updateMany: async (query, update) => {
      if (!useSandboxDB) return MongooseModel.updateMany(query, update);

      let items = readSandbox();
      let count = 0;
      const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
      delete fieldsToUpdate.$set;

      items = items.map(item => {
        let match = true;
        for (let key in query) {
          if (item[key] !== query[key]) {
            match = false;
            break;
          }
        }
        if (match) {
          count++;
          return { ...item, ...fieldsToUpdate, updatedAt: new Date().toISOString() };
        }
        return item;
      });

      writeSandbox(items);
      return { modifiedCount: count };
    },

    findByIdAndDelete: async (id) => {
      if (!useSandboxDB) return MongooseModel.findByIdAndDelete(id).lean();
      
      let items = readSandbox();
      let item = items.find(item => item._id === id || String(item._id) === String(id));
      if (!item) return null;
      
      let filtered = items.filter(item => item._id !== id && String(item._id) !== String(id));
      writeSandbox(filtered);
      return item;
    },

    deleteOne: async (query = {}) => {
      if (!useSandboxDB) return MongooseModel.deleteOne(query);
      
      let items = readSandbox();
      let idx = items.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx === -1) return { deletedCount: 0 };
      
      items.splice(idx, 1);
      writeSandbox(items);
      return { deletedCount: 1 };
    },

    deleteMany: async (query = {}) => {
      if (!useSandboxDB) return MongooseModel.deleteMany(query);

      let items = readSandbox();
      let originalLength = items.length;
      items = items.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });

      writeSandbox(items);
      return { deletedCount: originalLength - items.length };
    },

    countDocuments: async (query = {}) => {
      if (!useSandboxDB) return MongooseModel.countDocuments(query);
      let items = readSandbox();
      if (Object.keys(query).length === 0) return items.length;
      return items.filter(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }).length;
    }
  };
};
