import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, BookOpen, MessageCircle, PhoneCall, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Aide = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aide et Support</h1>
            <p className="text-muted-foreground">Trouvez des réponses à vos questions et obtenez de l'aide</p>
          </div>
          <HelpCircle className="h-10 w-10 text-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Consultez notre documentation complète pour comprendre toutes les fonctionnalités de la plateforme.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Accéder à la documentation
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Chat Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Discutez en direct avec notre équipe de support pour résoudre rapidement vos problèmes.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Démarrer une conversation
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-blue-500" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Contactez-nous par téléphone ou par email pour toute question ou assistance.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
                  +33 (0)1 23 45 67 89
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  support@penda-industria.com
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Foire Aux Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment configurer un nouveau capteur ?</AccordionTrigger>
                <AccordionContent>
                  Pour configurer un nouveau capteur, accédez à la page Paramètres, puis cliquez sur l'onglet "Capteurs". 
                  Cliquez sur "Ajouter un capteur" et suivez les instructions pour connecter et configurer votre nouveau capteur.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Comment interpréter les prédictions d'anomalies ?</AccordionTrigger>
                <AccordionContent>
                  Les prédictions d'anomalies sont basées sur des modèles d'apprentissage automatique qui analysent les tendances 
                  historiques de vos données. Une prédiction d'anomalie indique une déviation significative par rapport aux modèles 
                  normaux. Consultez la page "Prédiction ML" pour plus de détails sur chaque prédiction.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Comment exporter mes données historiques ?</AccordionTrigger>
                <AccordionContent>
                  Pour exporter vos données historiques, accédez à la page "Historique", sélectionnez la période souhaitée, 
                  puis cliquez sur le bouton "Exporter" en haut à droite. Vous pouvez choisir entre plusieurs formats d'exportation 
                  comme CSV, Excel ou JSON.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Comment configurer les alertes automatiques ?</AccordionTrigger>
                <AccordionContent>
                  Pour configurer les alertes automatiques, accédez à la page "Paramètres" puis à l'onglet "Alertes". 
                  Vous pouvez définir des seuils personnalisés pour chaque type de capteur et choisir les méthodes de notification 
                  (email, SMS, notification dans l'application).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Comment entraîner un nouveau modèle ML ?</AccordionTrigger>
                <AccordionContent>
                  Pour entraîner un nouveau modèle d'apprentissage automatique, accédez à la page "Prédiction ML", 
                  puis cliquez sur l'onglet "Gestion des modèles". Cliquez sur "Créer un nouveau modèle" et suivez 
                  les instructions pour sélectionner les données d'entraînement et configurer les paramètres du modèle.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Tutoriels Vidéo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Prise en main de la plateforme", duration: "5:32" },
                { title: "Configuration des capteurs", duration: "8:15" },
                { title: "Analyse des données historiques", duration: "6:47" },
                { title: "Utilisation des modèles prédictifs", duration: "10:23" },
                { title: "Gestion des alertes", duration: "4:56" },
                { title: "Exportation et partage des données", duration: "3:18" },
              ].map((video, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <PlayButton />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

const PlayButton = () => (
  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  </div>
);

export default Aide;