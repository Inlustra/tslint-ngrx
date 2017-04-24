
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
    ACTION_TYPE_VALUE_CASE = this.getOptions() && this.getOptions()[1] || 'title';
    FAILURE_STRING = `Action type values must be ${this.ACTION_TYPE_VALUE_CASE} case`;

    protected visitVariableDeclaration(node: ts.VariableDeclaration) {
        if (!this.isActionTypeDeclaration(node)) return;
        const objLiteral = node.initializer as ts.ObjectLiteralExpression;
        objLiteral.properties.forEach(obj => this.visitActionTypeProperty(obj))
    }

    visitActionTypeProperty(node: ts.ObjectLiteralElementLike) {
        if (node.kind !== ts.SyntaxKind.PropertyAssignment) return;
        const propertyName = node.name.getText();
        const desiredPropertyValue = this.toDesiredCase(propertyName);
        const propertyValue = this.getClosestStringRepresentation(node.initializer);
        if (propertyValue.getText().indexOf(desiredPropertyValue) === -1) {
            const start = propertyValue.getStart();
            const width = propertyValue.getWidth();
            let fix: Lint.Fix;
            if (propertyValue.kind === ts.SyntaxKind.StringLiteral) {
                fix = new Lint.Replacement(start + 1, width - 1, desiredPropertyValue)
            }
            this.addFailure(
                this.createFailure(
                    start,
                    width,
                    this.getFailureString(desiredPropertyValue),
                    fix)
            )
        }
    }

    getClosestStringRepresentation(node: ts.Expression): ts.Expression {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const callExpression = node as ts.CallExpression;
            if (callExpression.arguments.length === 1 &&
                callExpression.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
                return callExpression.arguments[0];
            }
        }
        return node;
    }

    isActionTypeDeclaration(node: ts.VariableDeclaration) {
        return node.initializer
            && node.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression
            && node.name.getText().endsWith(this.ACTION_TYPE_SUFFIX)
    }

    getFailureString(str: string) {
        return `Action type property value must contain '${str}'`
    }

    toDesiredCase(str: string) {
        return ((Case as any)[this.ACTION_TYPE_VALUE_CASE] || Case.title)(str);
    }

}
