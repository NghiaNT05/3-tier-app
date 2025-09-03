pipeline{
    agent any
    environment{
        SSH_CONFIG = 'ssh_config'
    }
    tools{
        nodejs 'nodejs-18'
    }
    stages{
        stage("Clean Workspace"){
            steps{
           cleanWS()
            }
        }
        stage("checkout from scm"){
            steps{
                git branch: 'main',credentialsId: 'github',url: 'git@github.com:NghiaNT05/3-tier-app.git'
            }
        }
        stage("prepare ssh config "){
            steps{
                withCredentials([sshUserPrivateKey(
                                credentialsId:'jenkins-ssh-key',
                                keyFileVariable: 'SSH_KEY'
                )]){
                    sh '''
                    echo "
                    Host bastion 
                        Hostname 18.143.183.0
                        User    ec2-user
                         IdentityFile $SSH_KEY
                    Host fe-server
                        HostName 10.0.0.121
                        User ec2-user
                        ProxyJump bastion
                        IdentityFile $SSH_KEY

                    Host be-server
                        HostName 10.0.10.112
                        User ec2-user
                        ProxyJump bastion
                        IdentityFile $SSH_KEY
                    " > ssh_config

                    chmod 600 ssh_config
                    '''
                }
            }
        }
    }
}