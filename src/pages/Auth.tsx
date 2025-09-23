import AuthForm from "@/components/AuthForm";
import Navigation from "@/components/Navigation";

const Auth = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AuthForm />
    </div>
  );
};

export default Auth;