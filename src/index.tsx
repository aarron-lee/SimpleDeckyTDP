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
import { useSelector } from 'react-redux'
import { minTdpSelector, maxTdpSelector } from './redux-modules/tdpRangeSlice'

// import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }


enum ServerAPIMethods {
  SET_SETTING = "set_setting",
  GET_SETTINGS = "get_settings",
  LOG_INFO = "log_info"
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  const minTdp = useSelector(minTdpSelector);
  const maxTdp = useSelector(maxTdpSelector);
  const logInfo = async (info: any) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.LOG_INFO, { info })
  }

  // useEffect(() => {
  //   serverAPI.callPluginMethod(ServerAPIMethods.GET_SETTINGS, {}).then((result) => {
  //      if(result.success) {
  //       logInfo(JSON.stringify(result))
  //     }
  //   })
  // }, [])

  const onFieldChange = async (
    fieldName: string,
    fieldValue?: string | number
  ) => {
    return await serverAPI.callPluginMethod(
      ServerAPIMethods.SET_SETTING,
      {
        name: fieldName,
        value: fieldValue,
      }
    );
  }

  return (
    <>
    <input type="number"/>
    <TdpRange minTdp={minTdp} maxTdp={maxTdp} onFieldChange={onFieldChange} logInfo={logInfo}/>
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
