import ThreePanelLayout from './components/layout/ThreePanelLayout';
import TopBar from './components/layout/TopBar';
import StatusBar from './components/layout/StatusBar';

const App = () => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
            <TopBar />
            <div className="flex-1 overflow-hidden relative">
                <ThreePanelLayout />
            </div>
            <StatusBar />
        </div>
    );
};

export default App;
