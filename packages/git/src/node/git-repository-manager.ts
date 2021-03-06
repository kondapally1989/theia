/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { Repository } from '../common';
import { GitRepositoryWatcher, GitRepositoryWatcherFactory } from "./git-repository-watcher";

@injectable()
export class GitRepositoryManager {

    @inject(GitRepositoryWatcherFactory)
    protected readonly watcherFactory: GitRepositoryWatcherFactory;
    protected readonly watchers = new Map<string, GitRepositoryWatcher>();

    run<T>(repository: Repository, op: () => Promise<T>): Promise<T> {
        const result = op();
        this.ensureSync(repository, result);
        return result;
    }

    getWatcher(repository: Repository): GitRepositoryWatcher {
        const existing = this.watchers.get(repository.localUri);
        if (existing) {
            return existing;
        }
        const watcher = this.watcherFactory({ repository });
        this.watchers.set(repository.localUri, watcher);
        return watcher;
    }

    protected async ensureSync<T>(repository: Repository, result: Promise<T>): Promise<T> {
        result.then(() => this.getWatcher(repository).sync());
        return result;
    }

}
