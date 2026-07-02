import React from 'react';
import { Tabs, Card, Typography } from 'antd';
import WholeOrderReturns from '../Manager/components/WholeOrderReturns';
import OrderItemReturns from '../Manager/components/OrderItemReturns';

const { Title, Text } = Typography;

const AdminReturnRequestPage = () => (
    <>
        <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Yêu cầu trả hàng</Title>
            <Text type="secondary">Quản lý tập trung tất cả yêu cầu trả hàng từ người dùng.</Text>
        </div>
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <Tabs defaultActiveKey="1" type="card">
                <Tabs.TabPane tab="Yêu cầu trả cả đơn" key="1">
                    <WholeOrderReturns />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Yêu cầu trả từng sản phẩm" key="2">
                    <OrderItemReturns />
                </Tabs.TabPane>
            </Tabs>
        </Card>
    </>
);

export default AdminReturnRequestPage;