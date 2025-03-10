import Sidebar from '../components/Sidebar'
import ReportSummaryCharts from '../components/ReportSummaryCharts';

function ReportSummary() {

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className='dashboard--content'>
                <ReportSummaryCharts />
            </div>
        </div>
    );
}

export default ReportSummary;

