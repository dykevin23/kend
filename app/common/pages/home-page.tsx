import { redirect } from "react-router";
import Header from "../components/header";

export function loader() {
  return redirect("/products");
}
