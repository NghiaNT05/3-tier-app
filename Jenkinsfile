pipeline {
    agent any
    environment {
        SSH_CONFIG = 'ssh_config'
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
                    '''
                }
            }
        }
        stage("Build Frontend") {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    // Copy build thành phẩm lên FE server
                    sh 'scp -F ssh_config -r build/* fe-server:/home/ec2-user/3-tier-app/frontend/'
                }
            }
        }
        stage("Deploy Backend") {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'

                    // Xóa backend cũ trên BE server
                    sh 'ssh -F ssh_config be-server "rm -rf /home/ec2-user/3-tier-app/backend/*"'

                    // Copy backend mới lên BE server
                    sh 'scp -F ssh_config -r * be-server:/home/ec2-user/3-tier-app/backend/'

                    // Restart backend (giả sử dùng pm2)
                    sh 'ssh -F ssh_config be-server "cd /home/ec2-user/3-tier-app/backend && pm2 restart index.js || pm2 start index.js"'
                }
            }
        }
        stage("Run DB Migration") {
            steps {
                sh 'ssh -F ssh_config be-server "cd /home/ec2-user/3-tier-app/backend && npx knex migrate:latest --env production"'
            }
        }
    }
    post {
        success {
            echo " CI/CD pipeline completed successfully!"
        }
        failure {
            echo " CI/CD failed. Please check the logs."
        }
    }
}
