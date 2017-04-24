
import * as Lint from "tslint";
import * as ts from "typescript";
import * as Case from 'case';

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ActionConstantWalker(sourceFile, this.getOptions()));
    }

}

// The walker takes care of all the work.
class ActionConstantWalker extends Lint.RuleWalker {

    ACTION_TYPE_SUFFIX = this.getOptions() && this.getOptions()[0] || 'ActionTypes';
    ACTION_TYPE_NAME_CASE = this.getOptions() && this.getOptions()[1] || 'constant';
    FAILURE_STRING = `Action type properties must be ${this.ACTION_TYPE_NAME_CASE} case`;

    protected visitVariableDeclaration(node: ts.VariableDeclaration) {
        if (!this.isActionTypeDeclaration(node)) return;
        const objLiteral = node.initializer as ts.ObjectLiteralExpression;
        objLiteral.properties.forEach(obj => this.visitActionTypeProperty(obj))
    }

    visitActionTypeProperty(node: ts.ObjectLiteralElementLike) {
        const propertyName = node.name.getText();
        if (Case.of(propertyName) !== this.ACTION_TYPE_NAME_CASE) {
            const start = node.getStart();
            const width = node.name.getWidth();
            const fix = new Lint.Replacement(start, propertyName.length, this.toDesiredCase(propertyName))
            this.addFailure(this.createFailure(start, width, this.FAILURE_STRING, fix));
        }
    }

    isActionTypeDeclaration(node: ts.VariableDeclaration) {
        return node.initializer
            && node.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression
            && node.name.getText().endsWith(this.ACTION_TYPE_SUFFIX)
    }

    toDesiredCase(str: string) {
        return ((Case as any)[this.ACTION_TYPE_NAME_CASE] || Case.title)(str);
    }
}
