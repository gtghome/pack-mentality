import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import GamePage from "./pages/GamePage";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={GamePage} />
        <Route path="/:roomCode" component={GamePage} />
      </Switch>
      <Toaster />
    </Router>
  );
}
