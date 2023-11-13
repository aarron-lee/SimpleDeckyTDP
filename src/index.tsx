import {
  // ButtonItem,
  definePlugin,
  // DialogButton,
  // Menu,
  // MenuItem,
  // PanelSection,
  // PanelSectionRow,
  // Router,
  ServerAPI,
  // showContextMenu,
  // TextField,
  staticClasses,
} from "decky-frontend-lib";
// import useForm from "./hooks/useForm";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";
// import { useEffect } from 'react';
import TdpRange from './molecules/TdpRange'
import { store } from './redux-modules/store'
import { Provider } from 'react-redux'
import { createServerApiHelpers } from './backend/utils'
// import { useInitialLoad, useSettingsState } from './hooks/useInitialLoad'
import { useInitialState } from './hooks/useInitialState'
// import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }


const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  const { setSetting } = createServerApiHelpers(serverAPI)

  const loading = useInitialState(serverAPI)


  const onFieldChange = async (
    fieldName: string,
    fieldValue?: string | number
  ) => {
    return await setSetting({ fieldName, fieldValue })
  }

  // if(loading) {
  //   return <div>Loading<div/>
  // }

  return (
    <>
     {!loading && <TdpRange onFieldChange={onFieldChange} />}
    </>
  );
};

const ContentContainer = ({ serverAPI }: { serverAPI: ServerAPI }) => {

  return <Provider store={store}>
    <Content serverAPI={serverAPI} />
  </Provider>
}

export default definePlugin((serverApi: ServerAPI) => {

  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });

  return {
    title: <div className={staticClasses.Title}>SimpleDeckyTDP</div>,
    content: <ContentContainer serverAPI={serverApi}/>,
    icon: <FaShip />,
    // onDismount() {
    //   serverApi.routerHook.removeRoute("/decky-plugin-test");
    // },
  };
});
