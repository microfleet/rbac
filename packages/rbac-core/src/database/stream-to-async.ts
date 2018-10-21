export const states = {
  notReadable: Symbol('not readable'),
  readable: Symbol('readable'),
  ended: Symbol('ended'),
  errored: Symbol('errored'),
}

/*
 * A contract for a promise that requires a clean up
 * function be called after the promise finishes.
 */
type PromiseWithCleanUp<T> = {
  promise: Promise<T>,
  cleanup: () => void,
}

/**
 * @typedef {Object} StreamAsyncToIterator~Options
 * @property {number} [size] - the size of each read from the stream for each iteration
 */
type StreamAsyncToIteratorOptions = {
  size?: number;
}

/**
 * @typedef {Object} StreamAsyncToIterator~Iteration
 * @property {boolean} done
 * @property {*} value
 */
type Iteration = {
  done: boolean;
  value: any;
}

type Reject = (err: any) => void

/**
 * Wraps a stream into an object that can be used as an async iterator.
 *
 * This will keep a stream in a paused state, and will only read from the stream on each
 * iteration. A size can be supplied to set an explicit call to `stream.read([size])` in
 * the options for each iteration.
 */
export default class StreamAsyncToIterator {
  private _stream: NodeJS.ReadableStream
  private _error: Error | null
  private _state: Symbol
  private _size?: number
  private _rejections: Set<Reject>

  /**
   * @param {NodeJS.ReadableStream} stream
   * @param {StreamAsyncToIterator~Options} [options]
   */
  constructor(stream: NodeJS.ReadableStream, options: StreamAsyncToIteratorOptions = {}) {
    /**
     * The underlying readable stream
     * @private
     * @type {Readable}
     */
    this._stream = stream

    /**
     * Contains stream's error when stream has error'ed out
     * @private
     * @type {?Error}
     */
    this._error = null

    /**
     * The current state of the iterator (not readable, readable, ended, errored)
     * @private
     * @type {Symbol}
     */
    this._state = states.notReadable

    /**
     * @private
     * @type {?number}
     */
    this._size = options.size

    /**
     * The rejections of promises to call when stream errors out
     * @private
     * @type {Set.<function(err: Error)>}
     */
    this._rejections = new Set()

    const handleStreamError = (err: Error) => {
      this._error = err
      this._state = states.errored
      for (const reject of this._rejections) {
        reject(err)
      }
    }

    const handleStreamEnd = () => {
      this._state = states.ended
    }

    stream.once('error', handleStreamError)
    stream.once('end', handleStreamEnd)
  }

  /**
   * Returns the next iteration of data. Rejects if the stream errored out.
   * @returns {Promise<StreamAsyncToIterator~Iteration>}
   */
  async next(): Promise<Iteration> {
    if (this._state === states.notReadable) {
      const read = this.untilReadable()
      const end = this.untilEnd()

        // need to wait until the stream is readable or ended
      try {
        await Promise.race([read.promise, end.promise])
        return this.next()
      } catch (e) {
        throw e
      } finally {
        // need to clean up any hanging event listeners
        read.cleanup()
        end.cleanup()
      }
    } else if (this._state === states.ended) {
      return { done: true, value: null }
    } else if (this._state === states.errored) {
      throw this._error
    } else /* readable */ {
      // stream.read returns null if not readable or when stream has ended

      const data = this._size ? this._stream.read(this._size) : this._stream.read()

      if (data !== null) {
        return { done: false, value: data }
      }

      // we're no longer readable, need to find out what state we're in
      this._state = states.notReadable
      return this.next()
    }
  }

  // tslint:disable-next-line:function-name
  public [Symbol.asyncIterator]() {
    return this
  }

  /**
   * Waits until the stream is readable. Rejects if the stream errored out.
   * @private
   * @returns {Promise}
   */
  private untilReadable(): PromiseWithCleanUp<void> {
    // let is used here instead of const because the exact reference is
    // required to remove it, this is why it is not a curried function that
    // accepts resolve & reject as parameters.
    let eventListener: any = null

    const promise: Promise<void> = new Promise((resolve, reject) => {
      eventListener = () => {
        this._state = states.readable
        this._rejections.delete(reject)

          // we set this to null to info the clean up not to do anything
        eventListener = null
        resolve()
      }

        // on is used here instead of once, because
        // the listener is remove afterwards anyways.
      this._stream.once('readable', eventListener)
      this._rejections.add(reject)
    })

    const cleanup = () => {
      if (eventListener == null) return
      this._stream.removeListener('readable', eventListener)
    }

    return { cleanup, promise }
  }

  /**
   * Waits until the stream is ended. Rejects if the stream errored out.
   * @private
   * @returns {Promise}
   */
  private untilEnd(): PromiseWithCleanUp<void> {
    let eventListener: any = null

    const promise: Promise<void> = new Promise((resolve, reject) => {
      eventListener = () => {
        this._state = states.ended
        this._rejections.delete(reject)

        eventListener = null
        resolve()
      }

      this._stream.once('end', eventListener)
      this._rejections.add(reject)
    })

    const cleanup = () => {
      if (eventListener == null) return
      this._stream.removeListener('end', eventListener)
    }

    return { cleanup, promise }
  }
}
