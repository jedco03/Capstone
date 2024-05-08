import Sidebar from '../components/Sidebar'
import AddRecordForm from '../components/AddRecordForm';
import '../styles/dashStyles.css';

function AddRecordPage() {

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className='dashboard--content'>
                <AddRecordForm />
            </div>
        </div>
    );
}

export default AddRecordPage;

