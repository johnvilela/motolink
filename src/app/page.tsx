import { LoginForm } from "@/components/forms/login-form";

export default function Home() {
  console.log("Home page rendered");

  return (
    <main>
      <h1>MOTOLINK</h1>
      <LoginForm />
    </main>
  );
}
