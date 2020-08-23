import { useEffect, useRef, useState } from "react";

const useApi = (url: string, eager = true) => {
  const [state, setState] = useState({loading: eager, data: null, error: null})
  const isMountedRef = useRef(true)


  const performAction = () => {
    setState(ps => ({...ps, loading: true, error: null }))

    fetch(url)
      .then(res => res.json())
      .then((data) => {
        setState(ps => ({...ps, data, loading: false, error: null }))
      })
      .catch(error => {
        setState(ps => ({...ps, data: null, loading: false, error }))
      });
  }

  useEffect(() => {
    isMountedRef.current = true

    if (!eager)
      return () => {}

    performAction()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {...state, performAction}
}

export default useApi
