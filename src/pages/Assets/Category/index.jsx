import React, { Component } from 'react';
import { Card, Table, Button, message, Modal, Form, Select, Input } from 'antd'
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons'

import LinkButton from '../../../components/LinkButton';
import { reqCategorys, reqAddCategory, reqUpdateCategory, reqDelCategory } from '../../../api'
import { CATEGORYS } from '../../../utils/constant'

const Item = Form.Item
const Option = Select.Option


class Category extends Component {
    state = {
        loading: false,

        subCategorys: [],
        parentId: '0',
        parentName: '',
        showStatus: 0
    }

    // categorys = [
    //     { id: 'PC', name: 'PC终端', parent_id: '0' },
    //     { id: 'Printer', name: '网络打印机', parent_id: '0' },
    //     { id: 'Server', name: '服务器', parent_id: '0' },
    //     { id: 'NetDevice', name: '网络设备', parent_id: '0' },
    //     { id: 'SecDevice', name: '安全设备', parent_id: '0' },
    //     { id: 'Software', name: '软件', parent_id: '0' },
    // ];

    formAddRef = React.createRef()
    formUpdateRef = React.createRef()

    columns = [
        {
            title: '分类名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '操作',
            key: 'action',
            width: 300,
            render: (category) => (
                <span>
                    {this.state.parentId === '0' ? null : <LinkButton onClick={() => this.showUpdate(category)}>修改分类</LinkButton>}
                    {this.state.parentId === '0' ? <LinkButton onClick={() => this.showSubCategorys(category)}>查看子分类</LinkButton> : null}
                    {this.state.parentId === '0' ? null : <LinkButton onClick={() => this.delCategory(category)}>删除分类</LinkButton>}
                </span>
            ),
        },
    ];

    //显示二级子分类列表
    showSubCategorys = (category) => {
        this.setState({
            parentId: category.id,
            parentName: category.name
        }, () => {
            this.getCategory()
        })

    }

    //返回一级分类列表
    showCategorys = () => {
        this.setState({
            parentId: '0',
            parentName: '',
            subCategorys: []
        })
    }

    //获取二级分类列表
    getCategory = async () => {
        this.setState({ loading: true })
        const parentId = this.state.parentId
        const result = await reqCategorys(parentId)
        this.setState({ loading: false })
        if (result.code === "success") {
            const categorys = result.data
            this.setState({ subCategorys: categorys })
        } else {
            message.error('获取分类列表失败')
        }

    }

    //显示增加分类对话框
    showAdd = () => {
        let { parentId } = this.state
        if (parentId === '0')
            parentId = 'PC'
        this.setState({ showStatus: 1 }, () => {
            this.formAddRef.current.setFieldsValue({
                parentId,
                categoryName: '',
            })
        })
    }
    //增加分类
    addCategory = (values) => {
        this.formAddRef.current.validateFields()
            .then(async values => {
                const { parentId, categoryName } = values
                const result = await reqAddCategory(parentId, categoryName)
                if (result.code === "success") {
                    if (parentId === this.state.parentId && parentId !== '0') {
                        this.getCategory()
                    }
                    // if (parentId === '0') {
                    //     this.getCategory('0')
                    // }

                } else {
                    message.error('增加分类失败')
                }

                this.setState({ showStatus: 0 })
            })
            .catch(err => {

            })


    }

    //显示更新分类对话框
    showUpdate = (category) => {
        this.category = category
        this.setState({ showStatus: 2 }, () => {
            this.formUpdateRef.current.setFieldsValue({
                categoryName: category.name,
            })
        })
    }
    //更新分类
    updateCategory = (values) => {
        this.formUpdateRef.current.validateFields()
            .then(async values => {
                const categoryName = values.categoryName
                const { id, parent_id, name } = this.category
                if (categoryName !== name) {
                    const result = await reqUpdateCategory(id, parent_id, categoryName)
                    if (result.code === "success") {
                        this.getCategory()
                    } else {
                        message.error('增加分类失败')
                    }
                }

                this.setState({ showStatus: 0 })
            })
            .catch(err => {

            })


    }

    //删除分类
    delCategory = (category) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定删除分类：' + category.name + '？',
            okText: '确定 ',
            cancelText: '取消',
            onOk: async () => {
                const { id } = category
                const result = await reqDelCategory(id)
                if (result.code === "success") {
                    this.getCategory()
                } else {
                    message.error('删除分类失败')
                }
            }
        })
    }

    //关闭模态对话框
    handleCancel = () => {
        this.setState({ showStatus: 0 })
    }

    componentDidMount() {
        //this.getCategory()
    }

    render() {
        const { subCategorys, loading, parentId, parentName, showStatus } = this.state
        const title = parentId === '0' ? '一级分类列表' :
            (
                <span>
                    <LinkButton onClick={this.showCategorys}>一级分类列表</LinkButton>
                    <ArrowRightOutlined />
                    <span style={{ marginLeft: 5 }}>{parentName}</span>
                </span>
            )
        const extra = (
            <Button type="primary" icon={<PlusOutlined />} onClick={this.showAdd}>
                添加
            </Button>
        )

        return (
            <Card title={title} extra={extra} >
                <Table
                    rowKey='id'
                    loading={loading}
                    bordered
                    dataSource={parentId === '0' ? CATEGORYS : subCategorys}
                    columns={this.columns}
                />

                <Modal title="添加分类"
                    okText="确定"
                    cancelText="取消"
                    visible={showStatus === 1}
                    onCancel={this.handleCancel}
                    onOk={this.addCategory}
                >
                    <Form ref={this.formAddRef} >
                        <Item name="parentId">
                            <Select>
                                {CATEGORYS.map(c => <Option value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Item>
                        <Item
                            name="categoryName"
                            rules={[
                                {
                                    required: true,
                                    message: '分类名必须输入',
                                },
                                {
                                    max: 20,
                                    message: '分类名最多20位',
                                },
                            ]}
                        >
                            <Input placeholder='请输入分类名称' />
                        </Item>
                    </Form>
                </Modal>
                <Modal title="更新分类"
                    okText="确定"
                    cancelText="取消"
                    visible={showStatus === 2}
                    onCancel={this.handleCancel}
                    onOk={this.updateCategory}
                >
                    <Form ref={this.formUpdateRef} >
                        <Item
                            name="categoryName"
                            rules={[
                                {
                                    required: true,
                                    message: '分类名必须输入',
                                },
                                {
                                    max: 20,
                                    message: '分类名最多20位',
                                },
                            ]}
                        >
                            <Input />
                        </Item>
                    </Form>
                </Modal>
            </Card >
        );
    }
}

export default Category;