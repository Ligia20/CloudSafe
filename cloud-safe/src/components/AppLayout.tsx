import React from "react";

import {
  IonSplitPane,
} from "@ionic/react";

import Menu from "./Menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
}) => {

  return (
    <IonSplitPane contentId="main">

      {/* Side menu */}
      <Menu />

      {/* Main content */}
      <main id="main">
        {children}
      </main>

    </IonSplitPane>
  );
};

export default AppLayout;