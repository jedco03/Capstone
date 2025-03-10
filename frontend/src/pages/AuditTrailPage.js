import Sidebar from '../components/Sidebar';
import AuditTrailTable from '../components/AuditTrailTable';

function AuditTrailPage() {

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className='dashboard--content'>
                <AuditTrailTable/>
            </div>
        </div>
    );
}

export default AuditTrailPage;

