import { useEffect, useRef } from "react";

const useTimeout = (cb, time) => {
  const cbFnRef = useRef(cb)

  useEffect(() => {
    cbFnRef.current = cb
  }, [cb])

  useEffect(() => {
    const id = setTimeout(() => {
      cbFnRef.current()
    }, time)

    return () => {
      clearTimeout(id)
    }
  }, [time])
}

export default useTimeout
