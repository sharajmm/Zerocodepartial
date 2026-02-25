import ThreePanelLayout from './components/layout/ThreePanelLayout';
import TopBar from './components/layout/TopBar';
import StatusBar from './components/layout/StatusBar';
import CollabProvider from './components/collaboration/CollabProvider';
import InviteModal from './components/collaboration/InviteModal';
import JoinModal from './components/collaboration/JoinModal';

const App = () => {
    return (
        <CollabProvider>
            <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
                <TopBar />
                <div className="flex-1 overflow-hidden relative">
                    <ThreePanelLayout />
                    <InviteModal />
                    <JoinModal />
                </div>
                <StatusBar />
            </div>
        </CollabProvider>
    );
};

export default App;
