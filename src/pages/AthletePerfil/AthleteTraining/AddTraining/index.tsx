import React, { useCallback, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { MdTitle, MdDescription } from 'react-icons/md';
import { GiStairsGoal, GiCycle } from 'react-icons/gi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useHistory } from 'react-router-dom';
import { useAthlete } from '~/hooks/AthleteContext';
import * as Yup from 'yup';
import { useToast } from '~/hooks/ToastContext';
import 'react-datepicker/dist/react-datepicker.css';
import api from '~/services/api';
import getValidationErrors from '~/utils/getValidationErrors';
import { useTraining } from '~/hooks/TrainingContext';
import Input from '~/components/Inputs/Text';
import Select from '~/components/Inputs/Select';
import Loading from '~/components/Loading';
import Button from '~/components/Button';
import { Container } from './styles';

interface NewTrainingFormData {
    title: string;
    description: string;
    cycle: number;
    objective: number;
}

interface RoutineInterface {
    id: string;
    title: string;
    description: string;
}

interface TrainingInterface {
    id: string;
    title: string;
    description?: string;
    objective: number;
    routines?: RoutineInterface[];
}


interface ModalProps {
    children?: React.ReactNode;
    icon?: string;
    newTraining(training?: TrainingInterface): void;
    athleteId: string;

}


const NewTraining: React.FC<ModalProps> = ({ newTraining, athleteId }) => {
    const formRef = useRef<FormHandles>(null);
    const [modal, setModal] = useState(false);
    const { athlete, setAthlete } = useAthlete();
    const history = useHistory();
    const { addToast } = useToast();
    const { setTraining } = useTraining();
    const [loading, setLoading] = useState(false);



    const toggle = () => setModal(!modal);

    const handleSubmit = useCallback(
        async ({ title, description, cycle, objective }: NewTrainingFormData) => {
            try {
                formRef.current?.setErrors({});
                setLoading(true)
                const schema = Yup.object().shape({
                    title: Yup.string().required('Campo obrigatório'),
                    description: Yup.string(),
                    cycle: Yup.number(),
                    objective: Yup.number(),
                });

                await schema.validate(
                    {
                        title,
                        description,
                        cycle,
                        objective,
                    },
                    {
                        abortEarly: false,
                    },
                );

                const response = await api.post('/training', {
                    title,
                    description,
                    cycle,
                    objective,
                });

                const athletes_ids = [athleteId];
                await api.post('/training/athletes', {
                    athletes_ids,
                    training_id: response.data.id,
                });



                setLoading(false)
                newTraining(response.data);
                setModal(false)
                addToast({
                    type: 'success',
                    title: 'Cadastro realizado! 🏋 ',
                    description: 'Aluno cadastrado com sucesso!',
                });
            } catch (err) {
                console.log(err);
                setLoading(false)
                if (err instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(err);

                    formRef.current?.setErrors(errors);

                    return;
                }

                addToast({
                    type: 'error',
                    title: 'Erro no cadastro',
                    description: 'Ocorreu um erro ao fazer cadastro, tente novamente.',
                });
            }
        },
        [addToast, history, setTraining],
    );

    return (
        <Container>
            {loading && <Loading />}
            <span onClick={toggle} className="open-modal">
                <h3 >Clique aqui para adicionar</h3>
            </span>
            <Modal centered isOpen={modal} toggle={toggle}>
                <ModalHeader>Adicionar Treino</ModalHeader>
                <ModalBody>
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <div>
                            <div id="title">
                                <Input name="title" icon={MdTitle} placeholder="Titulo" />
                            </div>
                            <div id="cycle">
                                <Select
                                    label="Modelo"
                                    icon={GiCycle}
                                    options={[
                                        { key: 'Nenhum', value: 0 },
                                        { key: 'A B', value: 2 },
                                        { key: 'A B C', value: 3 },
                                        { key: 'A B C D', value: 4 },
                                        { key: 'A B C D E', value: 5 },
                                        { key: 'A B C D E F', value: 6 },
                                        { key: 'A B C D E F G', value: 7 },
                                    ]}
                                    name="cycle"
                                />
                            </div>
                            <div id="objective">
                                <Select
                                    label="Objetivo"
                                    icon={GiStairsGoal}
                                    options={[
                                        { key: 'Hipertrofia', value: 1 },
                                        { key: 'Emagrecimento', value: 2 },
                                        { key: 'Resistencia', value: 3 },
                                    ]}
                                    name="objective"
                                />
                            </div>
                            <div id="description">
                                <Input
                                    name="description"
                                    icon={MdDescription}
                                    placeholder="Descrição"
                                />
                            </div>
                        </div>
                        <Button type="submit">Cadastrar</Button>
                    </Form>

                </ModalBody>
            </Modal>
        </Container>
    );
};

export default NewTraining;
