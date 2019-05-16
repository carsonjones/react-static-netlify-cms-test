import React from "react";
import { useRouteData } from "react-static";

export default function Test() {
  const { test } = useRouteData();
  console.log(test);
  return (
    <div>
      {test.map((item, index)=>{
          return (
              <div key={index}>{item.content}</div>
          )
      })}
    </div>
  );
}
