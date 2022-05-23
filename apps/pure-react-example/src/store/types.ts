import { useEffect, useState } from 'react';

export type Car = {
  id: string;
  Name: string;
  Miles_per_Gallon: number;
  Cylinders: number;
  Displacement: number;
  Horsepower: number;
  Weight_in_lbs: number;
  Acceleration: number;
  Year: string;
  Origin: string;
};

export type Cars = Car[];

export type Data<T> = {
  values: T[];
  columns: Array<string>;
  numericColumns: Array<string>;
  categorialColumns: Array<string>;
};

export const initialData: Data<Car> = {
  values: [],
  columns: [],
  numericColumns: [],
  categorialColumns: ["Origin", "Year"],
};

export function useData() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<any>(false);
  const [data, setData] = useState<Data<Car>>(initialData);

  useEffect(() => {
    fetch("./data/cars.json")
      .then((res) => res.json())
      .then((data) => {
        setData((d) => {
          const columns = [...Object.keys(data.cars[0]), "id"];
          const numericColumns = columns.filter(
            (c) => ![...d.categorialColumns, "id", "Name"].includes(c)
          );
          return {
            ...d,
            values: data.cars.map((car: any, idx: number) => ({
              ...car,
              id: `${car.Name} - ${idx}`,
            })),
            columns,
            numericColumns,
          };
        });
      })
      .catch((err) => {
        setIsError(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return {
    isLoading,
    isError,
    data,
  };
}
