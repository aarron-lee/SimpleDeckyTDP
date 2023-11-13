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
import { VFC, useEffect } from "react";
import { FaShip } from "react-icons/fa";
// import { useEffect } from 'react';
import TdpRange from './molecules/TdpRange'
import { store } from './redux-modules/store'
import { Provider } from 'react-redux'
import { createServerApiHelpers } from './backend/utils'

// import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }


const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {

  const { logInfo, getSettings, setSetting } = createServerApiHelpers(serverAPI)

  useEffect(() => {
    getSettings().then((result) => {
       if(result.success) {
        logInfo(`initial load ${JSON.stringify(result)}`)
      }
    })
  }, [])

  const onFieldChange = async (
    fieldName: string,
    fieldValue?: string | number
  ) => {
    return await setSetting({ fieldName, fieldValue })
  }

  return (
    <>
    <TdpRange onFieldChange={onFieldChange} logInfo={logInfo}/>
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
