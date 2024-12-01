import cluster from 'cluster';
import os from 'os';

export class Cluster {
  public static createCluster(main: () => Promise<void>): void {
    const cpuCount = Cluster.getCpuCount();
    console.log('cpuCount', cpuCount);

    if (cluster.isMaster) {
      console.log(`Starting cluster with ${cpuCount} workers...`);
      console.log(`Master server is running on process ${process.pid}`);

      for (let i = 0; i < cpuCount; i++) {
        console.log(`Forking process number ${i + 1}...`);
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.warn(`Worker ${worker.id} died. `);
        console.warn('Starting a new worker...');
        cluster.fork();
      });
    } else {
      main();
    }
  }

  private static getCpuCount(): number {
    console.log('🚀 ~ Cluster ~ getCpuCount ~ process.env.WORKERS_COUNT:', process.env.WORKERS_COUNT);
    if (process.env.WORKERS_COUNT) {
      return parseInt(process.env.WORKERS_COUNT, 10);
    }
    if (process.env.NODE_ENV === 'production') {
      return os.cpus().length;
    }
    return 1;
  }
}
