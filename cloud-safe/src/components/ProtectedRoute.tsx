import React, { useCallback } from "react";
import {
  Route,
  Redirect,
  RouteProps,
} from "react-router-dom";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const setAuthenticated = useCallback((value: boolean) => {
    localStorage.setItem(
      "authenticated",
      value ? "true" : "false"
    );
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        const authenticated =
          localStorage.getItem("authenticated");

        console.log("ProtectedRoute:");
        console.log("  path:", props.location.pathname);
        console.log("  authenticated:", authenticated);

        // CONDITION 1:
        // User is authenticated
        if (authenticated === "true") {
          console.log("Authenticated → Dashboard");

          return <Component {...props} />;
        }

        // CONDITION 2:
        // User explicitly logged out
        if (authenticated === "false") {
          console.log("Not authenticated → Login");

          return <Redirect to="/login" />;
        }

        // CONDITION 3:
        // No authentication value exists
        if (authenticated === null) {
          console.log("No authentication state");

          setAuthenticated(false);

          return <Redirect to="/login" />;
        }

        // Fallback
        return <Redirect to="/login" />;
      }}
    />
  );
};

export default ProtectedRoute;