import Header from "./components/Header";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <Home />
    </div>
  );
}
