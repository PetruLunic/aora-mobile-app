import {useEffect, useState} from "react";
import {showErrorAlert} from "@/lib/alert";

function useAppwriteQuery<T> (fn: (...args: any[]) => Promise<T>, initialState: T)
    : {data: T, isLoading: boolean, refetch: () => Promise<void>} {
  const [data, setData] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await fn();

      setData(response)
    } catch (e) {
      showErrorAlert("Error", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData()
  }, []);

  return {data, isLoading, refetch: fetchData};
}

export default useAppwriteQuery;