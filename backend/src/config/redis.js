import { EventEmitter } from 'events';

export let useSandboxRedis = true;
export let redisClient = null;

// Mock Local Background Job Queue Simulator
class LocalQueue extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
  }

  async add(jobName, data) {
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: jobName,
      data,
      progress: 0,
      updateProgress: async (p) => {
        job.progress = p;
        this.emit('progress', job, p);
      }
    };
    
    // Defer processing to simulate async thread behaviour
    setTimeout(() => {
      const worker = LocalWorker.instances[this.name];
      if (worker && worker.processor) {
        worker.processor(job)
          .then(result => {
            this.emit('completed', job, result);
          })
          .catch(err => {
            this.emit('failed', job, err);
          });
      }
    }, 500);

    return job;
  }
}

class LocalWorker {
  static instances = {};

  constructor(name, processor) {
    this.name = name;
    this.processor = processor;
    LocalWorker.instances[name] = this;
  }
}

export { LocalQueue as Queue, LocalWorker as Worker };

export const connectRedis = async () => {
  console.log('✅ Background queue initialized (in-memory sandbox fallback enabled).');
  useSandboxRedis = true;
};
