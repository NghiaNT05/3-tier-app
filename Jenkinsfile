pipeline {
    agent any
    environment {
        SSH_CONFIG = 'ssh_config'
        KNOWN_HOSTS = 'known_hosts'
    }
    tools {
        nodejs 'nodejs-18'
    }
    stages {
        stage("Clean Workspace") {
            steps {
                cleanWs()
            }
        }
        stage("Checkout from SCM") {
            steps {
                git branch: 'main', credentialsId: 'github', url: 'git@github.com:NghiaNT05/3-tier-app.git'
            }
        }
       stage("Prepare SSH Config") {
    steps {
        withCredentials([sshUserPrivateKey(
            credentialsId: 'jenkins-ssh-key',
            keyFileVariable: 'SSH_KEY'
        )]) {
            dir("${env.WORKSPACE}") {
                sh '''
                echo "
                Host bastion 
                    HostName 18.143.183.0
                    User ec2-user
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

                ssh-keyscan -H 18.143.183.0 >> known_hosts
                ssh-keyscan -H 10.0.0.121 >> known_hosts
                ssh-keyscan -H 10.0.10.112 >> known_hosts

                chmod 600 known_hosts
                '''
            }
        }
    }
}
        stage("Build Frontend") {
            steps {
                dir('frontend') {
                    script {
                        def workspace = env.WORKSPACE
                        sh """
                            npm ci
                            npm run build
                            scp -F ${workspace}/${SSH_CONFIG} -o UserKnownHostsFile=${workspace}/${KNOWN_HOSTS} -r dist/* fe-server:/home/ec2-user/3-tier-app/frontend/
                        """
                    }
                }
            }
        }
        stage("Deploy Backend") {
            steps {
                dir('backend') {
                    script {
                        def workspace = env.WORKSPACE
                        sh """
                            npm ci
                            npm test
                            ssh -F ${workspace}/${SSH_CONFIG} -o UserKnownHostsFile=${workspace}/${KNOWN_HOSTS} be-server "rm -rf /home/ec2-user/3-tier-app/backend/*"
                            scp -F ${workspace}/${SSH_CONFIG} -o UserKnownHostsFile=${workspace}/${KNOWN_HOSTS} -r * be-server:/home/ec2-user/3-tier-app/backend/
                            ssh -F ${workspace}/${SSH_CONFIG} -o UserKnownHostsFile=${workspace}/${KNOWN_HOSTS} be-server "cd /home/ec2-user/3-tier-app/backend && pm2 restart index.js || pm2 start index.js"
                        """
                    }
                }
            }
        }
        stage("Run DB Migration") {
            steps {
                script {
                    def workspace = env.WORKSPACE
                    sh """
                        ssh -F ${workspace}/${SSH_CONFIG} -o UserKnownHostsFile=${workspace}/${KNOWN_HOSTS} be-server "cd /home/ec2-user/3-tier-app/backend && npx knex migrate:latest --env production"
                    """
                }
            }
        }
    }
    post {
        success {
            echo "CI/CD pipeline completed successfully!"
        }
        failure {
            echo "CI/CD failed. Please check the logs."
        }
    }
}
