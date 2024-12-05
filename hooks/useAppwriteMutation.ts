import {useState} from "react";
import {showErrorAlert} from "@/lib/alert";

function useAppwriteMutation<T> (fn: (...args: any[]) => Promise<T>, initialState?: T)
    : [trigger: () => Promise<void>, {data: T | undefined, isLoading: boolean}] {
  const [data, setData] = useState<T | undefined>(initialState);
  const [isLoading, setIsLoading] = useState(false);

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

  return [fetchData, {data, isLoading}];
}

export default useAppwriteMutation;