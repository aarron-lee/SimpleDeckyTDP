import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from 'decky-frontend-lib';
import { FC, memo } from 'react';
import { FaShip } from 'react-icons/fa';
import TdpRange from './components/molecules/TdpRange';
import { TdpSlider } from './components/molecules/TdpSlider';
import { PollTdp } from './components/molecules/PollTdp';
import { store } from './redux-modules/store';
import { Provider } from 'react-redux';
import { createServerApiHelpers } from './backend/utils';
import { useInitialState } from './hooks/useInitialState';
import { TdpProfiles } from './components/molecules/TdpProfiles';

const Content: FC<{ serverAPI: ServerAPI }> = memo(
  ({ serverAPI }) => {
    const { setSetting, saveTdp } = createServerApiHelpers(serverAPI);

    const loading = useInitialState(serverAPI);

    const onFieldChange = async (
      fieldName: string,
      fieldValue?: string | number
    ) => {
      return await setSetting({ fieldName, fieldValue });
    };

    return (
      <>
        {!loading && (
          <>
            <TdpSlider persistToSettings={saveTdp} />
            <TdpProfiles persistState={onFieldChange} />
            <TdpRange onFieldChange={onFieldChange} />
            <PollTdp persistPollState={onFieldChange} />
          </>
        )}
      </>
    );
  }
);

const ContentContainer: FC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {
  return (
    <Provider store={store}>
      <Content serverAPI={serverAPI} />
    </Provider>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>SimpleDeckyTDP</div>,
    content: <ContentContainer serverAPI={serverApi} />,
    icon: <FaShip />,
  };
});
