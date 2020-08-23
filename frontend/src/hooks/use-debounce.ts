import { useEffect, useRef } from "react";

const useDebounce = (fn: Function, data: any, time: number, eager = false) => {
  const canRegister = useRef(eager)
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  useEffect(() => {
    if (!canRegister.current) {
      canRegister.current = true
      return () => {}
    }

    const id = setTimeout(fnRef.current, time)

    return () => clearTimeout(id)
  }, [data, time])
}

export default useDebounce
