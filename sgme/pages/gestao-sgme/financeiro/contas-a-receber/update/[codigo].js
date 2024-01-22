import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Head from "next/head";
import {http} from "@/utils/http";
import ModalComponent from "@/components/ModalComponent";
import ButtonFechar from "@/components/ButtonFechar";
import {getUserFromCookie} from "@/utils/Cookies";
import {isAfter, parseISO} from "date-fns";

const UpdateReceita = () => {
    const router = useRouter();
    const {codigo} = router.query;

    const [erroData, setErroData] = useState(false)
    const [erroDados, setErroDados] = useState("")

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        router.push('/gestao-sgme/financeiro/contas-a-receber')
    };


    const [receita, setReceita] = useState({});

    const [cliente, setCliente] = useState({});

    const [status, setStatus] = useState([false]);


    useEffect(() => {
        if (codigo) {
            const dataUser = getUserFromCookie();
            http.get(`/receitas/${codigo}`, {
                headers: {
                    Authorization: `Bearer ${dataUser.token}`
                }
            })
                .then((response) => {
                        setReceita(response.data)
                    }
                )
                .catch((error) => {
                    console.log("Erro ao buscar receita" + error)
                })
        }

    }, [codigo])


    useEffect(() => {
        const dataUser = getUserFromCookie();
        if (receita.cliente_id)
            http.get(`/clientes/${receita.cliente_id}`, {
                headers: {
                    Authorization: `Bearer ${dataUser.token}`
                }
            })
                .then((response) => {
                    setCliente(response.data)
                })
                .catch((error) => console.log("Erro ao buscar cliente" + error))
    }, [receita.cliente_id])

    const handleUpdateReceita = async () => {
        const dataUser = getUserFromCookie();

        if (erroData !== true){
            try {
                await http
                    .put(`/receitas/${codigo}`, receita, {
                        headers: {
                            Authorization: `Bearer ${dataUser.token}`
                        }
                    })
                    .then((response) => {
                        setStatus(true)
                    })
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    console.error('Erro na resposta da API:', error.response.data);
                } else {
                    console.error('Erro ao enviar dados para a API:', error);
                }
            }
        }else {
            setErroDados("Nao foi possivel atualizar os dados, corrija os erros e tente novamente")
        }

    };


    const handleInputChange = (e) => {
        setReceita({...receita, [e.target.name]: e.target.value});
    };

    const handlerCancelar = () => {
        router.push('/gestao-sgme/financeiro/contas-a-receber');
    }

    const validateDataVencimento = (value) => {
        const dataVencimento = parseISO(value);
        const dataAtual = new Date();

        return isAfter(dataVencimento, dataAtual) || dataVencimento.toDateString() === dataAtual.toDateString();
    };


    return (
        <>
            <Head>
                <title>SGME - Alterando Receitas</title>
                <meta name="description" content="Generated by create next app"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>

            </Head>
            <div className="container-sm d-flex align-items-center justify-content-center mt-5">

                <form className="form-control-sm w-100">
                    <h1>{cliente.nome}</h1>
                    <input defaultValue={cliente.id}
                           readOnly={true}
                           name="cliente_id"
                           hidden
                           onChange={handleInputChange}

                    />

                    <div>
                        <p><b>Status:</b> {receita.status}</p>
                    </div>

                    <div className="d-sm-flex flex-row justify-content-between mb-3">
                        <div className="d-flex flex-column w-100 me-3">
                            <label htmlFor="valor">Valor: </label>
                            <input placeholder="R$"
                                   className="form-control"
                                   value={receita.valor}
                                   name="valor"
                                   onChange={handleInputChange}
                            />

                        </div>


                        <div className="d-flex flex-column w-100">
                            <label htmlFor="data_vencimento">Data Vencimento: </label>
                            <input type="date"
                                   className="form-control"
                                   value={receita.data_vencimento}
                                   name="data_vencimento"
                                   onChange={(e) => {
                                       handleInputChange(e);
                                       if (!validateDataVencimento(e.target.value)) {
                                           setErroData(true)
                                       }
                                   }}
                            />

                            {erroData === true ? (
                                <p className="alert alert-danger mt-3">A data de vencimento deve ser maior ou igual à data atual.</p>
                            ) : ("")}

                        </div>
                    </div>

                    <div className="d-sm-flex flex-row justify-content-between mb-3">

                        <div className="d-flex flex-column w-100 me-3">
                            <label htmlFor="forma_pagamento">Forma de Pagamento</label>
                            <select className="form-select"
                                    value={receita.forma_pagamento}
                                    name="forma_pagamento"
                                    onChange={handleInputChange}
                            >
                                <option hidden value={receita.forma_pagamento}>{receita.forma_pagamento}</option>
                                <option value="DINHEIRO">DINHEIRO</option>
                                <option value="PIX">PIX</option>
                                <option value="CARTAO">CARTAO</option>
                                <option value="BOLETO">BOLETO</option>
                            </select>


                        </div>

                        <div className="d-flex flex-column w-100 ">
                            <label htmlFor="status">Status</label>
                            <select className="form-select"
                                    value={receita.status}
                                    name="status"
                                    onChange={handleInputChange}
                            >
                                <option value={receita.status} hidden>{receita.status}</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Pago">Pago</option>
                            </select>

                        </div>
                    </div>

                    <div className="d-sm-flex flex-row justify-content-between mb-3">
                        <div className="d-flex flex-column w-100 me-3">
                            <label htmlFor="Obsercavao">Obervação: </label>
                            <textarea placeholder="Observacao"
                                      className="form-control"
                                      value={receita.observacao}
                                      name="observacao"
                                      onChange={handleInputChange}
                            />

                        </div>
                    </div>

                    <div className="w-100 d-flex justify-content-end ">
                        <button className="btn btn-success me-3" onClick={(e) => {
                            e.preventDefault()
                            handleUpdateReceita()
                            openModal()
                        }}>ALTERAR
                        </button>

                        <button className="btn btn-danger" onClick={(e) => {
                            e.preventDefault();
                            handlerCancelar();

                        }}>CANCELAR
                        </button>
                    </div>


                    <ModalComponent
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                    >
                        {status === true ? (
                            <div>
                                <p className="fw-bold text-success">Conta alterada com sucesso</p>
                            </div>

                        ) : (
                            <>
                                <p>Erro ao atualizar</p>
                                <p>{erroDados}</p>
                            </>

                        )}


                    </ModalComponent>
                </form>

            </div>
        </>
    )
}

export default UpdateReceita;