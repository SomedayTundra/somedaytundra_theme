import * as React from 'react'

export type LocalStorageOptions<T> = {
    serialize?: (value: T) => string
    deserialize?: (raw: string) => T
}

function readFromStorage<T>(key: string, defaultValue: T, deserialize: (raw: string) => T): T {
    try {
        const raw = window.localStorage.getItem(key)
        if (raw === null) return defaultValue
        return deserialize(raw)
    } catch {
        // if anything went wrong trying to fetch a locally-stored value, just give back the default value
        return defaultValue
    }
}

function defaultSerialize<T>(value: T): string {
    return JSON.stringify(value)
}

function defaultDeserialize<T>(raw: string): T {
    return JSON.parse(raw) as T
}

/**
 * Same shape as React.useState, but the value is read from and written back to localStorage under `key`.
 *
 * This gives us a "cheap" way to make controls look the way we left them across navigation and reloads.
 */
export function useLocalStorageState<T>(
    key: string,
    defaultValue: T,
    options?: LocalStorageOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const serialize = options?.serialize ?? defaultSerialize
    const deserialize = options?.deserialize ?? defaultDeserialize

    const [state, setState] = React.useState<T>(() => readFromStorage(key, defaultValue, deserialize))

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, serialize(state))
        } catch {
            // if we fail to save to local storage, no big deal, we have the default value to fall back on
        }
    }, [key, state, serialize])

    return [state, setState]
}
