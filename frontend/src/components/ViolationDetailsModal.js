import { Modal, Card, Descriptions, Typography, Button } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, IdcardOutlined, UserOutlined, CalendarOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ViolationDetailsModal = ({ visible, onCancel, selectedViolationDetails }) => {
  return (
    <Modal
      title="Violation Details"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {selectedViolationDetails ? (
        <Card
          bordered={false}
          style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 'bold', width: '30%', color: '#1890ff' }} // Blue label color
            contentStyle={{ backgroundColor: '#fafafa', padding: '12px' }} // Light gray background
          >
            <Descriptions.Item label={<span><FileTextOutlined /> Violation</span>}>
              <Text>{selectedViolationDetails.violationId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><InfoCircleOutlined /> Type</span>}>
              <Text>{selectedViolationDetails.type}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><FileTextOutlined /> Remarks</span>}>
              <Text>{selectedViolationDetails.remarks}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> Date</span>}>
              <Text>{new Date(selectedViolationDetails.date).toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><CheckCircleOutlined /> Status</span>}>
              <Text>{selectedViolationDetails.status}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><CheckCircleOutlined /> Acknowledged</span>}>
              <Text>
                {selectedViolationDetails.acknowledged ? (
                  <span style={{ color: '#52c41a' }}>Yes</span> // Green for "Yes"
                ) : (
                  <span style={{ color: '#f5222d' }}>No</span> // Red for "No"
                )}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><IdcardOutlined /> ID in Possession</span>}>
              <Text>
                {selectedViolationDetails.IsIDInPossession ? (
                  <span style={{ color: '#52c41a' }}>Yes</span> // Green for "Yes"
                ) : (
                  <span style={{ color: '#f5222d' }}>No</span> // Red for "No"
                )}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><UserOutlined /> Guard Name</span>}>
              <Text>{selectedViolationDetails.guardName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><FileTextOutlined /> Sanction</span>}>
              <Text>{selectedViolationDetails.sanction || 'No sanction assigned'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><LinkOutlined /> Proof</span>}>
              {selectedViolationDetails.proof ? (
                <a href={selectedViolationDetails.proof} target="_blank" rel="noopener noreferrer">
                  View Proof
                </a>
              ) : (
                <Text>No proof provided</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <p>Loading violation details...</p>
      )}
    </Modal>
  );
};

export default ViolationDetailsModal;