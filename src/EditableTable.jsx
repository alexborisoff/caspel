import './EditableTable.css';
import React, { useState, useMemo } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Popconfirm,
    Space,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

export const EditableTable = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [removingIDs, setRemovingIDs] = useState(new Set());

    const handleAdd = () => {
        form.resetFields();
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        form.setFieldsValue({ ...record, date: dayjs(record.date) });
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleDelete = (key) => {
        setRemovingIDs((prev) => new Set(prev).add(key));
        setTimeout(() => {
            setData((prev) =>
                prev.filter((item) => item.key !== key)
            );
            setRemovingIDs((prev) => {
                const copy = new Set(prev);
                copy.delete(key);
                return copy;
            });
        }, 700);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const newData = {
                ...values,
                key: editingRecord
                    ? editingRecord.key
                    : Date.now().toString(),
                date: values.date.format('DD-MM-YYYY'),
            };

            setData((prev) => {
                if (editingRecord) {
                    return prev.map((item) =>
                        item.key === editingRecord.key
                            ? newData
                            : item
                    );
                }
                return [...prev, newData];
            });
            setIsModalOpen(false);
        } catch (err) {
            console.log('Не валидирован:', err);
        }
    };

    const filteredData = useMemo(() => {
        return data.filter((item) =>
            Object.values(item).some((value) =>
                String(value)
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            )
        );
    }, [searchText, data]);

    const columns = [
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Возраст',
            dataIndex: 'age',
            key: 'age',
            sorter: (a, b) => a.age - b.age,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        type="primary"
                    />
                    <Popconfirm
                        title="Вы уверены, что хотите удалить?"
                        onConfirm={() => handleDelete(record.key)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Добавить
                </Button>
                <Input
                    placeholder="Поиск..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="key"
                rowClassName={(record) =>
                    removingIDs.has(record.key)
                        ? 'fade-out'
                        : 'fade-in'
                }
            />
            <Modal
                title={
                    editingRecord
                        ? 'Редактировать запись'
                        : 'Добавить запись'
                }
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Имя"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Введите имя',
                            },
                        ]}
                    >
                        <Input
                            onChange={(e) => {
                                const value = e.target.value;
                                const filtered = value.replace(
                                    /[0-9]/g,
                                    ''
                                );
                                form.setFieldsValue({
                                    name: filtered,
                                });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Дата"
                        name="date"
                        rules={[
                            {
                                required: true,
                                message: 'Выберите дату',
                            },
                        ]}
                    >
                        <DatePicker
                            format="DD-MM-YYYY"
                            className="w-full"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Возраст"
                        name="age"
                        rules={[
                            {
                                required: true,
                                message: 'Введите возраст',
                            },
                            {
                                type: 'number',
                                min: 0,
                                max: 100,
                                message:
                                    'Возраст должен быть от 0 до 100',
                            },
                        ]}
                    >
                        <InputNumber className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
