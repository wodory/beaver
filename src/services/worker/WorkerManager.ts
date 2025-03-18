import { Worker } from 'worker_threads';
import { logger } from '../../utils/logger';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// ESM에서 __dirname 획득
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 작업 결과 인터페이스
 */
export interface TaskResult<T = any> {
  taskId: string | number;
  success: boolean;
  result?: T;
  error?: string;
  startTime: Date;
  endTime: Date;
}

/**
 * 작업 정의 인터페이스
 */
export interface Task {
  id: string | number;
  type: string;
  data: any;
  priority?: number;
}

/**
 * 워커 옵션 인터페이스
 */
export interface WorkerManagerOptions {
  maxWorkers?: number;
  maxRetries?: number;
  retryDelay?: number;
  workerTimeout?: number;
}

/**
 * 워커 관리자 클래스
 * 
 * Node.js Worker Threads를 사용하여 작업을 병렬로 처리합니다.
 */
export class WorkerManager {
  private maxWorkers: number;
  private maxRetries: number;
  private retryDelay: number;
  private workerTimeout: number;
  private activeWorkers: Set<Worker>;
  private taskQueue: Task[];
  private resultMap: Map<string | number, TaskResult>;
  private workerScriptPath: string;
  
  /**
   * 워커 관리자 생성자
   * 
   * @param options 워커 관리자 옵션
   */
  constructor(options?: WorkerManagerOptions) {
    // CPU 코어 수를 기반으로 기본 워커 수 설정 (최소 2, 최대 코어 수 - 1)
    const cpuCount = os.cpus().length;
    const defaultWorkers = Math.max(2, Math.min(cpuCount - 1, 4));
    
    this.maxWorkers = options?.maxWorkers || defaultWorkers;
    this.maxRetries = options?.maxRetries || 3;
    this.retryDelay = options?.retryDelay || 1000;
    this.workerTimeout = options?.workerTimeout || 300000; // 5분 기본 타임아웃
    this.activeWorkers = new Set();
    this.taskQueue = [];
    this.resultMap = new Map();
    
    // 기본 워커 스크립트 경로 설정
    this.workerScriptPath = path.resolve(__dirname, '../../workers/task-worker.js');
    
    logger.info(`WorkerManager 초기화: 최대 워커 수 ${this.maxWorkers}, 최대 재시도 ${this.maxRetries}회`);
  }
  
  /**
   * 워커 스크립트 경로 설정
   * 
   * @param scriptPath 워커 스크립트 경로
   */
  setWorkerScriptPath(scriptPath: string): void {
    this.workerScriptPath = scriptPath;
  }
  
  /**
   * 작업 추가
   * 
   * @param task 추가할 작업
   */
  addTask(task: Task): void {
    this.taskQueue.push(task);
    logger.debug(`작업 추가됨: ID ${task.id}, 유형 ${task.type}, 현재 대기 작업 수: ${this.taskQueue.length}`);
  }
  
  /**
   * 여러 작업 추가
   * 
   * @param tasks 추가할 작업 배열
   */
  addTasks(tasks: Task[]): void {
    this.taskQueue.push(...tasks);
    logger.debug(`${tasks.length}개 작업 추가됨, 현재 대기 작업 수: ${this.taskQueue.length}`);
  }
  
  /**
   * 작업 큐 비우기
   */
  clearTaskQueue(): void {
    this.taskQueue = [];
    logger.debug('작업 큐 비워짐');
  }
  
  /**
   * 활성 워커 수 반환
   */
  getActiveWorkerCount(): number {
    return this.activeWorkers.size;
  }
  
  /**
   * 대기 중인 작업 수 반환
   */
  getPendingTaskCount(): number {
    return this.taskQueue.length;
  }
  
  /**
   * 모든 작업 처리
   * 
   * 작업 큐의 모든 작업을 워커 스레드를 사용하여 병렬로 처리합니다.
   * 
   * @returns 모든 작업의 결과 배열
   */
  async processAllTasks(): Promise<TaskResult[]> {
    logger.info(`${this.taskQueue.length}개 작업 처리 시작 (최대 ${this.maxWorkers}개 워커 사용)`);
    
    // 작업 큐가 비어있으면 즉시 빈 배열 반환
    if (this.taskQueue.length === 0) {
      logger.info('처리할 작업이 없습니다.');
      return [];
    }
    
    // 우선순위에 따라 작업 정렬
    this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // 작업 처리 시작
    const promises: Promise<void>[] = [];
    const results: TaskResult[] = [];
    
    try {
      // 작업 처리 루프
      while (this.taskQueue.length > 0 || this.activeWorkers.size > 0) {
        // 활성 워커 수가 최대 워커 수보다 작고 작업 큐에 작업이 있으면 새 워커 시작
        while (this.activeWorkers.size < this.maxWorkers && this.taskQueue.length > 0) {
          const task = this.taskQueue.shift();
          if (task) {
            const workerPromise = this.executeTask(task);
            promises.push(workerPromise);
          }
        }
        
        // 어떤 워커든 완료될 때까지 기다림
        if (this.activeWorkers.size > 0) {
          await Promise.race(promises);
          
          // 완료된 프로미스 제거 및 결과 수집
          for (let i = promises.length - 1; i >= 0; i--) {
            if (promises[i].constructor.name === 'Promise' && (promises[i] as any).isResolved) {
              promises.splice(i, 1);
            }
          }
        }
      }
      
      // 모든 결과 수집
      for (const result of this.resultMap.values()) {
        results.push(result);
      }
      
      logger.info(`모든 작업 처리 완료: 총 ${results.length}개 작업`);
      return results;
    } catch (error) {
      logger.error(`작업 처리 중 오류 발생: ${error}`);
      throw error;
    } finally {
      // 결과 맵 초기화
      this.resultMap.clear();
    }
  }
  
  /**
   * 특정 유형의 작업 처리
   * 
   * @param type 처리할 작업 유형
   * @param data 작업 데이터
   * @returns 작업 결과
   */
  async processTasksByType(type: string, data: any[]): Promise<TaskResult[]> {
    // 각 데이터 항목을 개별 작업으로 변환
    const tasks: Task[] = data.map((item, index) => ({
      id: `${type}-${index}`,
      type,
      data: item
    }));
    
    // 작업 추가 및 처리
    this.addTasks(tasks);
    return this.processAllTasks();
  }
  
  /**
   * 단일 작업 처리
   * 
   * @param task 처리할 작업
   * @returns 작업 결과
   */
  async processTask(task: Task): Promise<TaskResult> {
    this.addTask(task);
    const results = await this.processAllTasks();
    return results.find(r => r.taskId === task.id) || {
      taskId: task.id,
      success: false,
      error: '작업 결과를 찾을 수 없습니다.',
      startTime: new Date(),
      endTime: new Date()
    };
  }
  
  /**
   * 작업 실행
   * 
   * @param task 실행할 작업
   * @returns 작업 완료 Promise
   */
  private async executeTask(task: Task): Promise<void> {
    const taskId = task.id;
    let retryCount = 0;
    let success = false;
    
    const startTime = new Date();
    let result: any = null;
    let error: string | undefined = undefined;
    
    while (!success && retryCount <= this.maxRetries) {
      if (retryCount > 0) {
        logger.info(`작업 ${taskId} 재시도 중... (${retryCount}/${this.maxRetries})`);
        // 재시도 전에 지연
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
      
      try {
        // 워커 생성 및 실행
        result = await this.runWorker(task);
        success = true;
      } catch (err) {
        retryCount++;
        error = err instanceof Error ? err.message : String(err);
        logger.error(`작업 ${taskId} 실행 중 오류 (시도 ${retryCount}/${this.maxRetries + 1}): ${error}`);
      }
    }
    
    const endTime = new Date();
    
    // 작업 결과 저장
    this.resultMap.set(taskId, {
      taskId,
      success,
      result: success ? result : undefined,
      error: success ? undefined : error,
      startTime,
      endTime
    });
    
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    if (success) {
      logger.info(`작업 ${taskId} 완료: 소요 시간 ${duration.toFixed(2)}초`);
    } else {
      logger.error(`작업 ${taskId} 실패: 최대 재시도 횟수(${this.maxRetries}) 초과, 소요 시간 ${duration.toFixed(2)}초`);
    }
  }
  
  /**
   * 워커 실행
   * 
   * @param task 실행할 작업
   * @returns 워커 실행 결과
   */
  private async runWorker(task: Task): Promise<any> {
    return new Promise((resolve, reject) => {
      // 워커 생성
      const worker = new Worker(this.workerScriptPath, {
        workerData: { task }
      });
      
      // 활성 워커 추적
      this.activeWorkers.add(worker);
      
      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        logger.error(`작업 ${task.id} 타임아웃: ${this.workerTimeout}ms 초과`);
        worker.terminate();
        this.activeWorkers.delete(worker);
        reject(new Error(`작업 타임아웃: ${this.workerTimeout}ms 초과`));
      }, this.workerTimeout);
      
      // 메시지 수신 처리
      worker.on('message', (message) => {
        clearTimeout(timeoutId);
        this.activeWorkers.delete(worker);
        resolve(message);
      });
      
      // 오류 처리
      worker.on('error', (err) => {
        clearTimeout(timeoutId);
        this.activeWorkers.delete(worker);
        reject(err);
      });
      
      // 워커 종료 처리
      worker.on('exit', (code) => {
        clearTimeout(timeoutId);
        this.activeWorkers.delete(worker);
        if (code !== 0) {
          reject(new Error(`워커가 종료 코드 ${code}로 종료되었습니다.`));
        }
      });
    });
  }
  
  /**
   * 리소스 정리
   */
  async cleanup(): Promise<void> {
    // 모든 활성 워커 종료
    for (const worker of this.activeWorkers) {
      worker.terminate();
    }
    
    this.activeWorkers.clear();
    this.taskQueue = [];
    this.resultMap.clear();
    
    logger.info('워커 관리자 리소스 정리 완료');
  }
} 