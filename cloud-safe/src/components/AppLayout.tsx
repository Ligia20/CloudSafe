import React from "react";
import { IonSplitPane } from "@ionic/react";
import Menu from "./Menu";

interface AppLayoutProps{
  children:React.ReactNode;
}

const AppLayout:React.FC<AppLayoutProps>=({children})=>(
  <IonSplitPane contentId="main">
    <Menu/>
    <div id="main">
      {children}
    </div>
  </IonSplitPane>
);

export default AppLayout;